import { Select, ActionIcon, Container, Group, NumberInput, Text } from "@mantine/core";
import { TypeSelector } from "./TypeSelector";
import { dataTypes } from "./ReadTable";
import { IconArrowUp } from "@tabler/icons-react";
import { useState } from "react";
import { Write } from "../../wailsjs/go/main/App";

export function WriteTable() {
  const [dataType, setDataType] = useState<dataTypes>(dataTypes.U16)
  const [writeData, setWriteData] = useState<number[]>([])
  const [address, setAddress] = useState<number | string>('')
  const [writeValue, setWriteValue] = useState<number | string>('')
  function setWrite() {
    let num = writeValue as number
    let dataToWrite: number[] = []
    switch (dataType) {
      case dataTypes.U16:
        //TODO: Check if number too large
        dataToWrite = [num]

        break
      case dataTypes.I16:
        //TODO: Check if number in range
        dataToWrite = [num & 0xFFFF]
        break
      case dataTypes.U32:
      case dataTypes.I32:
        {
          let num1 = num & 0xFFFF
          let num2 = (num >> 16) & 0xFFFF
          dataToWrite = [num2, num1]
          break
        }
    }
    setWriteData(dataToWrite)
    Write(dataType, address as number, dataToWrite)
  }
  return (
    <Container bg="gray.1">
      <Text>Write Table</Text>
      <Group>
        <NumberInput placeholder="Register" size="xs" value={address} onChange={setAddress} />
        <NumberInput placeholder="Value" size="xs" onChange={setWriteValue} />
        <TypeSelector v={dataType} updateType={(v) => { setDataType(v) }} />
        <Select data={["Holding Register", "Discrete Input", "Input Register", "Coil"]} placeholder="Type" size="xs"
          radius="xs" onChange={() => { }} />
        <ActionIcon variant="default" onClick={setWrite}>
          <IconArrowUp />
        </ActionIcon>
      </Group>
      {JSON.stringify(writeData)}
    </Container>
  );
}
