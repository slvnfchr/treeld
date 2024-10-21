import { WithContext, ArchiveOrganization } from "./context/schema";

export type Repository = WithContext<ArchiveOrganization>;

export const converter: Function;

const map: Map<string, Function>;
export default map;
