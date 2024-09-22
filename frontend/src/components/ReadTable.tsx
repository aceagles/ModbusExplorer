import { Stack, Container, Group, NumberInput, Select, Table } from "@mantine/core";
enum dataTypes {
  BIN = "BIN",
  U16 = "U16",
  U32 = "U32",
  I16 = "I16",
  I32 = "I32",
  F32 = "F32",
  F64 = "F64",
}
export function ReadTable() {
  let rawData = [100,200,65300,0]
  const typeArray = [dataTypes.U16,  dataTypes.F32, dataTypes.U16]
  const typedData = typeArray.map((type, i) => {
    switch (type) {
      case dataTypes.BIN:
        {const val = rawData.shift()
        // Convert to binary
        return val!.toString(2)}
      case dataTypes.U16:
        return rawData.shift()
      case dataTypes.U32:
        {
        const val1 = rawData.shift()
        const val2 = rawData.shift()
        return (val1! << 16) + val2!}
      case dataTypes.I16:
        let val = rawData.shift()
        return val! - 0x10000
      case dataTypes.I32:
{        let val1 = rawData.shift()
        let val2 = rawData.shift()
        return (val1! << 16) + val2! - 0x100000000}
      case dataTypes.F32:
        {
        let val1 = rawData.shift()
        let val2 = rawData.shift()
        return new Float32Array(new Uint8Array([val1!, val2!]).buffer)[0]}
      case dataTypes.F64:
        let val1 = rawData.shift()
        let val2 = rawData.shift()
        let val3 = rawData.shift()
        let val4 = rawData.shift()
        return new Float64Array(new Uint8Array([val1!, val2!, val3!, val4!]).buffer)[0]
    }
  }
  )

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
        </Group>
        <Table withTableBorder withColumnBorders withRowBorders={false}>
          <Table.Tr>
            {
              typedData.map((v, i) => (<Table.Th>{i}</Table.Th>))
            }
          </Table.Tr>
          <Table.Tr>

            {
              typedData.map((v) => (<Table.Td>{v}</Table.Td>))
            }
          </Table.Tr>
        </Table>
      </Stack>
    </Container>
  );
}
