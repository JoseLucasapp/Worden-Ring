import itemsJson from "./words.json";

interface Item {
    id: string;
    name: string;
    image: string;
    description: string;
    type: string;
    effect: string;
}

const data: { data: Item[] } = itemsJson;

export { data };