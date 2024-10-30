import {
  Button,
  Switch,
  Stack,
  Box,
  Select,
  ActionIcon,
  Container,
  Group,
  NumberInput,
  Text,
} from "@mantine/core";
import { TypeSelector } from "./TypeSelector";
import { dataTypes } from "./ReadTable";
import { IconArrowUp } from "@tabler/icons-react";
import { useState } from "react";
import { Write } from "../../wailsjs/go/main/App";
import { notifications } from "@mantine/notifications";

export function WriteTable() {
  const [dataType, setDataType] = useState<dataTypes>(dataTypes.U16);
  const [writeData, setWriteData] = useState<number[]>([]);
  const [address, setAddress] = useState<number | string>("");
  const [writeValue, setWriteValue] = useState<number | string>(0);
  const [regType, setRegType] = useState<string>("Holding Register");
  function setWrite() {
    if (address == "") {
      notifications.show({
        title: "Failed to Write",
        message: "Set an address.",
        autoClose: 20000,
      });
      return;
    }
    let dataToWrite: number[] = [];
    if (regType == "Coil") {
      if (writeValue == "") {
        dataToWrite = [0];
      } else {
        dataToWrite = [writeValue as number];
      }
    } else {
      let num = writeValue as number;
      switch (dataType) {
        case dataTypes.U16:
          //TODO: Check if number too large
          dataToWrite = [num];

          break;
        case dataTypes.I16:
          //TODO: Check if number in range
          dataToWrite = [num & 0xffff];
          break;
        case dataTypes.U32:
        case dataTypes.I32: {
          let num1 = num & 0xffff;
          let num2 = (num >> 16) & 0xffff;
          dataToWrite = [num2, num1];
          break;
        }
        case dataTypes.F32:
          const floatArray = new Float32Array([num]);
          const uint16Array = new Uint16Array(floatArray.buffer);
          // Reverse the array to match the byte order of the modbus
          dataToWrite = Array.from(uint16Array).reverse();
      }
    }
    setWriteData(dataToWrite);
    Write(regType, address as number, dataToWrite)
      .then(() =>
        notifications.show({
          title: "Registers Written",
          message: "",
        })
      )
      .catch((err) =>
        notifications.show({
          title: "Failed to write.",
          message: err,
          autoClose: 20000,
        })
      );
  }
  return (
    <div>
      <Stack>
        <Group>
          <NumberInput
            placeholder="Register"
            size="xs"
            value={address}
            onChange={setAddress}
          />
          {regType == "Holding Register" ? (
            <NumberInput
              value={writeValue}
              placeholder="Value"
              size="xs"
              onChange={setWriteValue}
            />
          ) : (
            <Switch
              checked={writeValue != "" && (writeValue as number) > 0}
              onChange={(event) =>
                setWriteValue(event.currentTarget.checked ? 1 : 0)
              }
            />
          )}
          {regType == "Holding Register" && (
            <TypeSelector
              v={dataType}
              updateType={(v) => {
                setDataType(v);
              }}
            >
              <Button
                onClick={() => {}}
                variant="default"
                radius="xs"
                size="xs"
                p={"2px"}
              >
                {dataType}
              </Button>
            </TypeSelector>
          )}
          <Select
            data={["Holding Register", "Coil"]}
            placeholder="Type"
            size="xs"
            radius="xs"
            onChange={(value) => setRegType(value!)}
            value={regType}
          />
          <ActionIcon variant="default" onClick={setWrite}>
            <IconArrowUp />
          </ActionIcon>
        </Group>
        {writeData.length > 0 && (
          <Text>Raw Data : {JSON.stringify(writeData)}</Text>
        )}
      </Stack>
    </div>
  );
}
