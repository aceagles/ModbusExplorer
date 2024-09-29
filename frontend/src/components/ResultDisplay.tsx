import { Text, Group, Stack, Divider } from "@mantine/core";
import { dataTypes } from "./ReadTable";
import { TypeSelector } from "./TypeSelector";

export function ResultDisplay({ typedData, typeArray, type, setType }: { typedData: ({ address: number; value: any; } | undefined)[]; typeArray: string[]; type: string; setType: (i: number, s: dataTypes) => void; }) {
  return (

    <Group>
      {typedData.length > 0 &&
        <Stack gap="xs">
          <Text>Register:</Text>
          <Text>Value:</Text>
        </Stack>}
      {typedData.map((v, i) => (
        <Group>
          <Stack gap="xs"
          >
            <strong>{v!.address} </strong>
            <div><Text size="lg">{v!.value}</Text>
              {(type == "Holding Register" || type == "Input Register") &&
                <TypeSelector v={typeArray[i]} updateType={(s) => setType(i, s)}>
                  <Text size="xs" c="gray.5" style={{ cursor: "pointer" }}>{typeArray[i]}</Text>
                </TypeSelector>}</div>
          </Stack>
          <Divider orientation="vertical" />
        </Group>
      ))}
    </Group>
  );
}
