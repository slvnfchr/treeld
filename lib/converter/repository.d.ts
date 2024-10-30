import { ArchiveOrganization } from "./context/schema";
import { ObjectLD } from "./context";

export type RepositoryLD = ObjectLD<ArchiveOrganization>;

export const converter: Function;

const map: Map<string, Function>;
export default map;
