import { Menu, Button } from "@mantine/core";
import { dataTypes } from "./ReadTable";

export function TypeSelector(props: { v: string; updateType: (type: dataTypes) => void; }) {
  return (
    <Menu shadow="md" width={80}>
      <Menu.Target>
        <Button onClick={() => { }} variant="default" radius="xs" size="xs" p={"2px"}>{props.v}</Button>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.values(dataTypes).map((type) => (
          <Menu.Item key={"Types" + type} onClick={() => props.updateType(type)}>
            {type}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
