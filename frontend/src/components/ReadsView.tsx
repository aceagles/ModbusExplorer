import { useState } from "react"
import { Box, Button, Text } from "@mantine/core"

export default function ReadsView() {
  const [reads, setReads] = useState<number>(1)
  const readTables = []
  for (let i = 0; i < reads; i++) {
    readTables.push(<ReadTable />)
  }
  return (
    <>
      {readTables}
      <Button onClick={() => setReads((read) => read + 1)}>Add Read</Button>
    </>
  )
}

function ReadTable() {
  return (
    <Box bd="" bg="blue">
      <Text c="white">test</Text>
    </Box>
  )
}