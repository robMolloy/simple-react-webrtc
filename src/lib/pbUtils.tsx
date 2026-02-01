import { z } from "zod";

const findMessagesInObjectOfObjects = (p: {
  obj: Record<string, unknown>;
  onFoundMessage: (p: { message: string; key: string }) => void;
}) => {
  Object.entries(p.obj)
    .map(([key, innerObj]) => ({ ...messageObjSchema.safeParse(innerObj), key }))
    .filter((val) => val.success)
    .map((val) => ({ message: val.data.message, key: val.key }))
    .forEach((keyMessageObj) => p.onFoundMessage(keyMessageObj));
};

const objSchema = z.record(z.string(), z.unknown());
const messageObjSchema = z.object({ message: z.string() });
const errorSchema = z.object({
  message: z.string().optional(),
  response: z.object({
    data: objSchema.transform((outerObj) => {
      const messages: string[] = [];

      const pushMessagesFromObjectOfObjects = (obj: Record<string, unknown>) => {
        findMessagesInObjectOfObjects({
          obj,
          onFoundMessage: (msgKeyObj) => messages.push(`${msgKeyObj.message} (${msgKeyObj.key})`),
        });
      };
      // shallow objects
      pushMessagesFromObjectOfObjects(outerObj);

      // deep objects
      Object.values(outerObj)
        .map((innerObj) => objSchema.safeParse(innerObj))
        .filter((val) => val.success)
        .map((val) => val.data)
        .forEach((innerObj) => pushMessagesFromObjectOfObjects(innerObj));

      return { messages };
    }),
  }),
});

export const extractMessageFromPbError = (p: { error: unknown }) => {
  const parsed = errorSchema.safeParse(p.error);

  if (!parsed.success) return;

  const initMessages = parsed.data.response.data.messages;
  const messageAsArray = parsed.data.message ? [parsed.data.message] : [];
  const messages = [...messageAsArray, ...initMessages];

  if (messages.length === 0) return;
  return messages;
};
