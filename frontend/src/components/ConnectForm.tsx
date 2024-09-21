import { Button, NumberInput, TextInput } from "@mantine/core";
import { Form } from "@mantine/form";

export default function ConnectForm() {
  return (
    <>
      <TextInput label="IP Address" placeholder="192.168.1.100" />
      <NumberInput label="Port" value={502} />
      <NumberInput label="Unit ID" value={1} />
      <Button>Connect</Button>
    </>
  )
}