import { SelectItem } from "@/components/ui/select";
import React from "react";
import states from "@/data/states.json";
const StateSelectItems = () => {
  return Object.entries(states).map(([abbreviation, name]) => (
    <SelectItem key={abbreviation} value={abbreviation}>
      {name}
    </SelectItem>
  ));
};

export default StateSelectItems;
