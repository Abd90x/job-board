import { SelectItem } from "@/components/ui/select";
import React from "react";
import countries from "@/data/countries.json";
const CountriesSelect = () => {
  return countries.map((country) => (
    <SelectItem key={country.name} value={country.name}>
      {country.name}
    </SelectItem>
  ));
};

export default CountriesSelect;
