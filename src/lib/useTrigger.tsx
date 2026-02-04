import { useState, useEffect } from "react";

export type TTriggerData = [] | undefined;
export const useTrigger = () => {
  const [data, setData] = useState<TTriggerData>(undefined);

  const fire = () => setData([]);

  return { data, fire };
};

export const useTriggerListener = (p: { triggerValue: TTriggerData; fn: () => void }) => {
  useEffect(() => {
    if (!!p.triggerValue) p.fn();
  }, [p.triggerValue]);
};
