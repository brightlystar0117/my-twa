import { useEffect, useState } from "react";
import Counter from "../contracts/counter";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";
import { Address, OpenedContract } from "@ton/core";

export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | number>();
    const { sender }= useTonConnect();

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const counterContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new Counter(
            Address.parse('EQCdZd9gvoo7EhwrqqizlR5Y6LqImMRS5PBZFmSoVslefJ2W')  
        );
        return client.open(contract) as OpenedContract<Counter>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!counterContract) return;
            setVal(null);
            const val = await counterContract.getCounter();
            setVal(Number(val));
            await sleep(5000);
            getValue();
        }
        getValue();
    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrement(sender);
        }
    }
}