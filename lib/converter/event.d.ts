import { WithContext, Event as EventSchema } from "./context/schema";

export type Event = WithContext<EventSchema>;

const map: Map<string, Function>;
export default map;
