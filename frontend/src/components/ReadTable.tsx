import { Menu, Stack, Container, Group, NumberInput, Select, Table, ActionIcon } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Read } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";
type modbusData = main.modbusData;
enum dataTypes {
  BIN = "BIN",
  U16 = "U16",
  U32 = "U32",
  I16 = "I16",
  I32 = "I32",
  F32 = "F32",
}

export function ReadTable() {
  // rawData array of modbusData
  const [rawData, setRawData] = useState<modbusData[]>([]);
  const [typeArray, setTypeArray] = useState<dataTypes[]>(Array(rawData.length).fill(dataTypes.U16));
  useEffect(() => {
    setTypeArray(Array(rawData.length).fill(dataTypes.U16));
  }, [rawData.length]);
  const rawDataCopy = [...rawData];
  const typedData: ({address: number, value: any} | undefined)[] = typeArray.map((type, i) => {
    switch (type) {
      case dataTypes.BIN:
        {
          const val = rawDataCopy.shift();
          // Convert to binary showing leading zeros
          return { address: val!.Address, value: val!.Value.toString(2).padStart(16, '0') };
        }
      case dataTypes.U16:
        {
          const val = rawDataCopy.shift();
          return { address: val!.Address, value: val!.Value };
        }
      case dataTypes.U32:
        {
          const val1 = rawDataCopy.shift();
          const val2 = rawDataCopy.shift();
            return { address: val1!.Address, value: val1!.Value << 16+ (val2!.Value) };
        }
      case dataTypes.I16:
        {
          const val = rawDataCopy.shift();
          const value = val!.Value;
          // Convert U16 to I16 using 2's complement
          const signedValue = value > 0x7FFF ? value - 0x10000 : value;
          return { address: val!.Address, value: signedValue };
        }
      case dataTypes.I32:
        {
          const val1 = rawDataCopy.shift();
          const val2 = rawDataCopy.shift();
          const combinedValue = (val1!.Value << 16) + val2!.Value;
          const signedValue = combinedValue > 0x7FFFFFFF ? combinedValue - 0x100000000 : combinedValue;
          return { address: val1!.Address, value: (val1!.Value << 16) + val2!.Value - 0x100000000 };
        }
      case dataTypes.F32:
        {
          const val1 = rawDataCopy.shift();
          const val2 = rawDataCopy.shift();
          return { address: val1!.Address, value: new Float32Array(new Uint16Array([val1!.Value, val2!.Value]).buffer)[0] };
        }
    }
  });
  
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
  const [address, setAddress] = useState<string | number>('');
  const [quantity, setQuantity] = useState<string | number>('');
  const [type, setReadType] = useState<string>("Holding Register");
  function ReadModbus() {
    Read(type, address as number, quantity as number)
      .then((data) => {
        console.log(data);
        setRawData(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <Container>
      <Stack>
        <Group justify="">
          <NumberInput placeholder="Start Register" size="xs"
            radius="xs" onChange={setAddress}/>
          <NumberInput placeholder="Quantity" size="xs"
            radius="xs" onChange={setQuantity}/>
          <Select data={["Holding Register", "Discrete Input", "Input Register", "Coil"]} placeholder="Type" size="xs"
            radius="xs" onChange={value => setReadType(value!)}/>
          <ActionIcon onClick={ReadModbus} variant="default" p={"2px"}>
            <IconRefresh />
          </ActionIcon>
        </Group>
        <Table withTableBorder withColumnBorders withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              {
                typedData.map((v, i) => (<Table.Th key={"address"+i}>{v!.address}</Table.Th>))
              }
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              {
                typedData.map((v, i) => (<Table.Td key={"Value"+i}>{v!.value}</Table.Td>))
              }
            </Table.Tr>
            <Table.Tr>
              {
                typeArray.map((v, i) => (<Table.Td key={"type"+i} ><TypeSelector v={v} updateType={(s) => setType(i, s) }/></Table.Td>))
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
          <Menu.Item key={"Types" + type} onClick={() => props.updateType(type)}>
            {type}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
