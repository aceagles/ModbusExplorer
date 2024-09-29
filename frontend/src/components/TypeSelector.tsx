import { Menu, Button } from "@mantine/core";
import { dataTypes } from "./ReadTable";

export function TypeSelector(props: { children: JSX.Element, v: string; updateType: (type: dataTypes) => void; }) {
  return (
    <Menu shadow="md" width={80}>
      <Menu.Target>
        {props.children}
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
