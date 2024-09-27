import { Switch, Stack, Box, Select, ActionIcon, Container, Group, NumberInput, Text } from "@mantine/core";
import { TypeSelector } from "./TypeSelector";
import { dataTypes } from "./ReadTable";
import { IconArrowUp } from "@tabler/icons-react";
import { useState } from "react";
import { Write } from "../../wailsjs/go/main/App";
import { notifications } from "@mantine/notifications";

export function WriteTable() {
  const [dataType, setDataType] = useState<dataTypes>(dataTypes.U16)
  const [writeData, setWriteData] = useState<number[]>([])
  const [address, setAddress] = useState<number | string>('')
  const [writeValue, setWriteValue] = useState<number | string>(0)
  const [regType, setRegType] = useState<string>("Holding Register")
  function setWrite() {

    let dataToWrite: number[] = []
    if (regType == "Coil") {
      if (writeValue == "") {
        dataToWrite = [0]
      } else {
        dataToWrite = [writeValue as number]
      }
    } else {
      let num = writeValue as number
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
    }
    setWriteData(dataToWrite)
    Write(regType, address as number, dataToWrite)
      .then(() => notifications.show({
        title: "Registers Written",
        message: ""
      }))
      .catch((err) => notifications.show({
        title: "Failed to write.",
        message: err,
        autoClose: 20000,
      }))
  }
  return (
    <div>
      <Group justify="space-between">
        <Box ><Text fw={700}>Write</Text></Box>
        <Stack>
          <Group>
            <NumberInput placeholder="Register" size="xs" value={address} onChange={setAddress} />
            {regType == "Holding Register" ?
              <NumberInput value={writeValue} placeholder="Value" size="xs" onChange={setWriteValue} />
              :
              <Switch
                checked={writeValue != '' && writeValue as number > 0}
                onChange={(event) => setWriteValue(event.currentTarget.checked ? 1 : 0)}
              />}
            <TypeSelector v={dataType} updateType={(v) => { setDataType(v) }} />
            <Select data={["Holding Register", "Coil"]} placeholder="Type" size="xs"
              radius="xs" onChange={(value) => setRegType(value!)} value={regType} />
            <ActionIcon variant="default" onClick={setWrite}>
              <IconArrowUp />
            </ActionIcon>
          </Group>
          {
            writeData.length > 0 && <Text>Raw Data : {JSON.stringify(writeData)}</Text>
          }
        </Stack>
        <div> </div>
      </Group>
    </div >
  );
}
