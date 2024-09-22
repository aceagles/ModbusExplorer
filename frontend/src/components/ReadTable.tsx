import { Menu, Stack, Container, Group, NumberInput, Select, Table, ActionIcon } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
enum dataTypes {
  BIN = "BIN",
  U16 = "U16",
  U32 = "U32",
  I16 = "I16",
  I32 = "I32",
  F32 = "F32",
}

interface modbusData {
  address: number,
  value: number
}
export function ReadTable() {
  // rawData array of modbusData
  const rawData: modbusData[] = [
    { address: 100, value: 0x1234 },
    { address: 101, value: 0x5678 },
    { address: 102, value: 0x9abc },
    { address: 103, value: 0xdef0 },
    { address: 104, value: 0x1234 },
    { address: 105, value: 0x5678 },
    { address: 106, value: 0x9abc },
    { address: 107, value: 0xdef0 }
  ];
  const [typeArray, setTypeArray] = useState<dataTypes[]>(Array(rawData.length).fill(dataTypes.U16));
  const typedData: ({address: number, value: any} | undefined)[] = typeArray.map((type, i) => {
    switch (type) {
      case dataTypes.BIN:
        {const val = rawData.shift()
        // Convert to binary showing leading zeros
        return {address: val!.address, value: val!.value.toString(2).padStart(16, '0')}
      }
      case dataTypes.U16:
        return rawData.shift()
      case dataTypes.U32:
        {
        const val1 = rawData.shift()
        const val2 = rawData.shift()
        return {address: val1!.address, value: (val1!.value << 16) + val2!.value}
        }
      case dataTypes.I16:
        let val = rawData.shift()
        return {address: val!.address, value: val!.value - 0x10000}
      case dataTypes.I32:
        {      
          let val1 = rawData.shift()
          let val2 = rawData.shift()
          return {address: val1!.address, value: (val1!.value << 16) + val2!.value - 0x100000000}
        }
      case dataTypes.F32:
        {
        let val1 = rawData.shift()
        let val2 = rawData.shift()

          return {address: val1!.address, value: new Float32Array(new Uint16Array([val1!.value, val2!.value]).buffer)[0]}
        }
    }
  }
  )
  function setType(i: number, type: dataTypes) {
    if (typeArray[i] === type) {
      return
    } 
    switch (type) {
      case dataTypes.BIN:
      case dataTypes.I16:
      case dataTypes.U16:
        setTypeArray((prev) => {
          let previousType = prev[i];
          prev[i] = type;
          if (previousType === dataTypes.U32 || previousType === dataTypes.I32 || previousType === dataTypes.F32) {
            prev.splice(i + 1, 0, dataTypes.U16);
          }
          return [...prev];
        });
        break;
      case dataTypes.I32:
      case dataTypes.U32:
      case dataTypes.F32:
        if (i >= typeArray.length - 1) {
          console.log("Not enough data points");
          return;
        }
        setTypeArray((prev) => {
          let previousType = prev[i];
          prev[i] = type;
          if (previousType === dataTypes.U16 || previousType === dataTypes.I16 || previousType === dataTypes.BIN) {
            if (prev[i + 1] === dataTypes.U32 || prev[i + 1] === dataTypes.I32 || prev[i + 1] === dataTypes.F32) {
              prev[i + 1] = dataTypes.U16;
            } else {
            prev.splice(i + 1, 1);
            }
          }
          return [...prev];});
        break;
  }
}

  return (
    <Container>
      <Stack>
        <Group justify="">
          <NumberInput placeholder="Start Register" size="xs"
            radius="xs" />
          <NumberInput placeholder="Quantity" size="xs"
            radius="xs" />
          <Select data={["Holding Register", "Discrete Input", "Input Register", "Coil"]} placeholder="Type" size="xs"
            radius="xs" />
          <ActionIcon onClick={() => {}} variant="default" p={"2px"}>
            <IconRefresh />
          </ActionIcon>
        </Group>
        <Table withTableBorder withColumnBorders withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              {
                typedData.map((v, i) => (<Table.Th key={i}>{v!.address}</Table.Th>))
              }
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              {
                typedData.map((v, i) => (<Table.Td key={i}>{v!.value}</Table.Td>))
              }
            </Table.Tr>
            <Table.Tr>
              {
                typeArray.map((v, i) => (<Table.Td><TypeSelector v={v} key={i} updateType={(s) => setType(i, s) }/></Table.Td>))
              }
              </Table.Tr> 
          </Table.Tbody>
        </Table>
      </Stack>
    </Container>
  );
}

function TypeSelector(props: {v: string, updateType: (type: dataTypes) => void}) {
  return (
    <Menu shadow="md" width={80}>
      <Menu.Target>
        <ActionIcon  onClick={() => {}} variant="default" p={"2px"}>{props.v}</ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.values(dataTypes).map((type) => (
          <Menu.Item key={type} onClick={() => props.updateType(type)}>
            {type}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
