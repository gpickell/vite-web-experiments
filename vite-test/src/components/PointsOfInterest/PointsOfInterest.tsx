import {
    LayoutElement,
    LayoutElementProperties,
} from "@vertigis/web/components";
import { styled, useWatchCollectionAndRerender } from "@vertigis/web/ui";
import MenuList from "@vertigis/web/ui/MenuList";
import Typography from "@vertigis/web/ui/Typography";
import { FC } from "react";

import PointsOfInterestModel from "./PointsOfInterestModel";
import PointOfInterest from "./PointOfInterest";

const LayoutElementStyled = styled(LayoutElement)(() => ({
    backgroundColor: "var(--primaryBackground)",
    padding: "1rem"
}));

const PointsOfInterest: FC<LayoutElementProperties<PointsOfInterestModel>> = (
    props
) => {
    const { model } = props;
    // Re-render whenever points of interest are added or removed from the
    // collection.
    useWatchCollectionAndRerender(model.pointsOfInterest);
    return (
        <LayoutElementStyled {...props} stretch className="PointsOfInterest">
            <Typography variant="h2">Points of Interest</Typography>
            <MenuList>
                {model.pointsOfInterest.toArray().map((poi) => (
                    <PointOfInterest
                        key={poi.id}
                        model={poi}
                        onClick={() => {
                            // This function returns `Promise<void>` which
                            // resolves when the map is done zooming, but in
                            // this case we only need to kick it off and don't
                            // need to wait for it to finish.
                            //
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            model.goto(poi);
                        }}
                        onDelete={() => {
                            model.pointsOfInterest.remove(poi);
                        }}
                    />
                ))}
            </MenuList>
        </LayoutElementStyled>
    );
};

export default PointsOfInterest;
