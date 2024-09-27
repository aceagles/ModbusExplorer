import { Button, NumberInput, TextInput } from "@mantine/core";
import { Connect, Disconnect } from "../../wailsjs/go/main/App";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function ConnectForm(props: { connected: boolean }) {
  const [IP, setIP] = useState<string>("");
  const [port, setPort] = useState<string | number>(502);
  const [unitID, setUnitID] = useState<number>(1);
  function ConnectModbus() {
    console.log("Connecting to", IP, port, unitID);
    let portNum = port as number;
    Connect(IP, portNum, unitID)
      .then(() => notifications.show({
        title: "Connected",
        message: ""
      }))
      .catch((err) => notifications.show({
        title: "Failed to Connect",
        message: err,
        autoClose: 20000
      }))
  }
  return (
    <>
      <TextInput label="IP Address" placeholder="192.168.1.100" onChange={(event) => setIP(event.currentTarget.value)} />
      <NumberInput label="Port" value={502} onChange={setPort} />
      {/* <NumberInput label="Unit ID" value={1} /> */}
      {
        !props.connected ?
          <Button onClick={ConnectModbus}>Connect</Button> : <Button onClick={Disconnect}>Disconnect</Button>
      }
    </>
  )
}