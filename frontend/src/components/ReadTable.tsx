import { Menu, Box, Text, Stack, Container, Group, NumberInput, Select, Table, ActionIcon, Divider, Button } from "@mantine/core";
import { IconCaretDownFilled, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Read } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";
import { TypeSelector } from "./TypeSelector";
import { notifications } from "@mantine/notifications";
type modbusData = main.modbusData;

export enum dataTypes {
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
  const [error, setError] = useState<string>('')

  // Form data TODO: replace with mantine form handler
  const [address, setAddress] = useState<string | number>('');
  const [quantity, setQuantity] = useState<string | number>('');
  const [type, setReadType] = useState<string>("Holding Register");

  // Update the array of data types whenever the number of fields returned changes.
  // This means they are retained when repeatedly getting data but enough are added when
  // new data comes through
  useEffect(() => {
    setTypeArray(Array(rawData.length).fill(dataTypes.U16));
  }, [rawData.length]);

  // Copy of raw data as getting the typed data consumes the array.
  const rawDataCopy = [...rawData];
  const typedData: ({ address: number, value: any } | undefined)[] = typeArray.map((type, i) => {
    // Iterate through the array of data types and convert respectively.
    // Consumes the array since there will be a different number of output elements depending
    // on the data types selected
    if (rawDataCopy.length == 0) return { address: 0, value: 0 };
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
          return { address: val1!.Address, value: ((val1!.Value << 16) >>> 0) + (val2!.Value >>> 0) };
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
          return { address: val1!.Address, value: signedValue };
        }
      case dataTypes.F32:
        {
          const val1 = rawDataCopy.shift();
          const val2 = rawDataCopy.shift();
          const u32 = new Uint32Array([((val1!.Value << 16) >>> 0) + (val2!.Value >>> 0)])
          return { address: val1!.Address, value: new Float32Array(u32.buffer)[0] };
        }
    }
  });

  // Sets an index to an array type. Needs to also handle removing or re-adding the following element
  // depending on the number of registers the type requires
  function setType(i: number, type: dataTypes) {
    if (typeArray[i] === type) {
      return
    }
    switch (type) {
      // 16 bit types
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
      // 32 bit types
      case dataTypes.I32:
      case dataTypes.U32:
      case dataTypes.F32:
        if (i >= typeArray.length - 1) {
          return;
        }
        setTypeArray((prev) => {
          let previousType = prev[i];
          prev[i] = type;
          // if previous type was 16 bit
          if (previousType === dataTypes.U16 || previousType === dataTypes.I16 || previousType === dataTypes.BIN) {
            // if next type in a rray is 32 bit then convert it back to 16 bit as the first register has just been nicked
            if (prev[i + 1] === dataTypes.U32 || prev[i + 1] === dataTypes.I32 || prev[i + 1] === dataTypes.F32) {
              prev[i + 1] = dataTypes.U16;
            } else {
              prev.splice(i + 1, 1);
            }
          }
          return [...prev];
        });
        break;
    }
  }

  // Call the read function from the go backend
  function ReadModbus() {
    Read(type, address as number, quantity as number)
      .then((data) => {
        if (data.length < rawData.length) {
          setTypeArray(Array(data.length).fill(dataTypes.U16));
        }
        setRawData(data);
        setError('')
      })
      .catch((err) => {
        setError(err)
        setRefreshRate("None")
        notifications.show({
          title: "Failed to Read",
          message: err
        })
      });
  }

  let content = error ? (<Text>{error}</Text>) : (
    <Group>
      {
        typedData.length > 0 &&
        <Stack gap="xs">
          <Text>Register:</Text>
          <Text>Value:</Text>
          {
            (type == "Holding Register" || type == "Input Register") &&
            <Text>Type:</Text>
          }
        </Stack>
      }
      {
        typedData.map((v, i) => (
          <Group>
            <Stack gap="xs"
            >
              <strong>{v!.address} <br /></strong>
              <Text>{v!.value} <br /></Text>
              {
                (type == "Holding Register" || type == "Input Register") &&
                <TypeSelector v={typeArray[i]} updateType={(s) => setType(i, s)} />
              }
            </Stack>
            <Divider orientation="vertical" />
          </Group>
        ))
      }
    </Group>
  )

  const [refreshRate, setRefreshRate] = useState<string>("None")
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Don't auto fetch if set to none or the menu is open
    if (refreshRate == "None" || opened) return;
    let refresh = 0
    switch (refreshRate) {
      case "1s":
        refresh = 1000;
        break
      case "2s":
        refresh = 2000;
        break
      case "5s":
        refresh = 5000;
        break
      case "10s":
        refresh = 10000;
        break
      case "30s":
        refresh = 30000;
        break
    }
    const interval = setInterval(ReadModbus, refresh)
    return () => clearInterval(interval)
  }, [refreshRate, address, quantity, opened]) // Needs to depend on all of these or ReadModbus will become out of date compared to the inputs 


  return (
    <Stack>
      <Group justify="">
        <NumberInput label="Start Register:" min={0} placeholder="Start Register" size="xs"
          radius="xs" onChange={setAddress} />
        <NumberInput placeholder="Quantity" label="Quantity:" size="xs" min={1} max={125}
          radius="xs" onChange={setQuantity} />
        <Select data={["Holding Register", "Discrete Input", "Input Register", "Coil"]} value={type} size="xs" label="Register Type"
          radius="xs" onChange={value => { setReadType(value!); setRawData([]) }} />
        <br />
        <RefreshSelector opened={opened} setOpened={setOpened} refreshRate={refreshRate} setRate={setRefreshRate} ReadModbus={ReadModbus} />
      </Group>
      {content}
    </Stack>
  );

  function RefreshSelector(props: { opened: boolean, setOpened: (b: boolean) => void, setRate: (rate: string) => void, refreshRate: string, ReadModbus: () => void }) {
    return (
      <div>
        <Button size="xs" onClick={props.ReadModbus} variant="default" p={"2px"} style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0, borderRight: "0px" }}>
          <IconRefresh />
        </Button>
        <Menu shadow="md" width={80} opened={props.opened} onChange={props.setOpened}>
          <Menu.Target>
            <Button size="xs" variant="default" style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0, borderLeft: "0px" }}>
              {
                props.refreshRate == "None" ?
                  <IconCaretDownFilled /> : <Text>{props.refreshRate}</Text>
              }
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Refresh Rate</Menu.Label>
            {
              ["None", "1s", "5s", "10s", "30s"].map((v) => (
                <Menu.Item onClick={() => props.setRate(v)}>{v}</Menu.Item>
              ))
            }
          </Menu.Dropdown>
        </Menu>
      </div>
    )
  }
}
