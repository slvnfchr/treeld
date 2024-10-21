import { WithContext, PostalAddress } from "./context/schema";

export type Address = WithContext<PostalAddress>;

const map: Map<string, Function>;
export default map;
