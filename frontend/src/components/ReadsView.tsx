import { useState } from "react"
import { Box, Button, Text, Stack, Group, Divider } from "@mantine/core"
import { ReadTable } from "./ReadTable"
import { IconCirclePlus } from "@tabler/icons-react"
import { WriteTable } from "./WriteTable"

enum tableType {
  read = 1,
  write
}

interface table {
  type: tableType,
  id: number
}

export default function ReadsView() {
  const [idCount, setIdCount] = useState<number>(1)
  const [tables, setTables] = useState<table[]>([{ type: tableType.read, id: 1 }])

  const tableComponents = tables.map(v => (
    <>
      {v.type == tableType.read ?
        <ReadTable key={v.id + " " + v.type} />
        :
        <WriteTable key={v.id + " " + v.type} />
      }
      <Divider />
    </>
  ))

  function addTable(type: tableType) {
    setTables(t => [...t, { type, id: idCount }])
    setIdCount(i => i + 1)
  }

  return (
    <>
      <Stack>{tableComponents}</Stack>
      <Group justify="center" mt="sm">
        <Button onClick={() => addTable(tableType.read)} variant="subtle" color="gray" size="xs" radius="xs"><IconCirclePlus /> Read</Button>
        <Button onClick={() => addTable(tableType.write)} variant="subtle" color="gray" size="xs" radius="xs"><IconCirclePlus /> Write</Button>
      </Group>
    </>
  )
}
