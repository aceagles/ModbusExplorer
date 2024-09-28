import { useState } from "react"
import { Box, Button, Text, Stack, Group, Divider, ActionIcon } from "@mantine/core"
import { ReadTable } from "./ReadTable"
import { IconCirclePlus, IconCross, IconX } from "@tabler/icons-react"
import { WriteTable } from "./WriteTable"

enum tableType {
  read = "Read",
  write = "Write"
}

interface table {
  type: tableType,
  id: number
}

export default function ReadsView() {
  const [idCount, setIdCount] = useState<number>(1)
  const [tables, setTables] = useState<table[]>([{ type: tableType.read, id: 1 }])

  const tableComponents = tables.map((v, i) => (
    <>

      <Group justify="space-between">
        <Group >
          <Text fw={700}>{v.type}</Text>
          <ActionIcon color="gray" variant="subtle" size="s" radius="xl" aria-label="Settings" onClick={() => setTables(table => { table.splice(i, 1); return [...table] })}>
            <IconX style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Group>
        {v.type == tableType.read ?
          <ReadTable key={v.id + " " + v.type} />
          :
          <WriteTable key={v.id + " " + v.type} />
        }
        <div></div>
      </Group>
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
