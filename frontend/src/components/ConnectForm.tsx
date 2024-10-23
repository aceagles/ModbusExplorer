import { Button, NumberInput, TextInput } from "@mantine/core";
import { SetUnitId, Connect, Disconnect } from "../../wailsjs/go/main/App";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function ConnectForm(props: { connected: boolean }) {
  const [IP, setIP] = useState<string>("");
  const [port, setPort] = useState<string | number>(502);
  const [unitID, setUnitID] = useState<string | number>(1);
  function ConnectModbus() {
    console.log("Connecting to", IP, port, unitID);
    let portNum = port as number;
    let numId = unitID as number;
    Connect(IP, portNum, numId)
      .then(() =>
        notifications.show({
          title: "Connected",
          message: "",
        })
      )
      .catch((err) =>
        notifications.show({
          title: "Failed to Connect",
          message: err,
          autoClose: 20000,
        })
      );
  }
  return (
    <>
      <TextInput
        label="IP Address"
        placeholder="192.168.1.100"
        onChange={(event) => setIP(event.currentTarget.value)}
        disabled={props.connected}
      />
      <NumberInput
        label="Port"
        value={port}
        onChange={setPort}
        disabled={props.connected}
      />
      <NumberInput
        label="Unit ID"
        value={unitID}
        onChange={(v) => {
          setUnitID(v);
          SetUnitId(v as number)
            .then(() =>
              notifications.show({
                title: "Set Unit ID",
                message: "",
              })
            )
            .catch((err) =>
              notifications.show({
                title: "Failed to Set ID",
                message: err,
              })
            );
        }}
      />
      {!props.connected ? (
        <Button onClick={ConnectModbus}>Connect</Button>
      ) : (
        <Button onClick={Disconnect}>Disconnect</Button>
      )}
    </>
  );
}
