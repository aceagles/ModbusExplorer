import { useState } from "react"
import { Box, Button, Text, Stack } from "@mantine/core"
import { ReadTable } from "./ReadTable"

export default function ReadsView() {
  const [reads, setReads] = useState<number>(1)
  const readTables = []
  for (let i = 0; i < reads; i++) {
    readTables.push(<ReadTable key={"radTables" + i} />)
  }
  return (
    <>
      <Stack>{readTables}</Stack>
      <Button onClick={() => setReads((read) => read + 1)}>Add Read</Button>
    </>
  )
}

