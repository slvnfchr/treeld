import { WithContext, Place as PlaceSchema } from "./context/schema";

export type Place = WithContext<PlaceSchema>;

export const converter: Function;

const map: Map<string, Function>;
export default map;
