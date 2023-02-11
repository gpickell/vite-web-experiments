import PointsOfInterest, {
    PointsOfInterestModel,
} from "./components/PointsOfInterest";

import { LibraryRegistry } from "@vertigis/web/config";

import hot from "vite-web-sdk/hot";

const LAYOUT_NAMESPACE = "custom.3432813e";

if (import.meta.hot) {
    import.meta.hot.accept();
    hot({ PointsOfInterest });
}

export default function (registry: LibraryRegistry): void {
    registry.registerComponent({
        // Show in the `map` category of the component toolbox.
        category: "map",
        iconId: "station-locator",
        name: "points-of-interest",
        namespace: LAYOUT_NAMESPACE,
        getComponentType: () => hot(PointsOfInterest),
        itemType: "points-of-interest-model",
        title: "Points of Interest",
    });
    registry.registerModel({
        getModel: (config) => new PointsOfInterestModel(config),
        itemType: "points-of-interest-model",
    });
    registry.registerCommand({
        name: "points-of-interest.create",
        itemType: "points-of-interest-model",
    });
}
