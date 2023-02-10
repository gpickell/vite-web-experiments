import {
    LayoutElement,
    LayoutElementProperties,
} from "@vertigis/web/components";
import { useWatchCollectionAndRerender } from "@vertigis/web/ui";
import MenuList from "@vertigis/web/ui/MenuList";
import Typography from "@vertigis/web/ui/Typography";
import { FC, useEffect, useState } from "react";

import PointsOfInterestModel from "./PointsOfInterestModel";
import PointOfInterest from "./PointOfInterest";
import "./PointsOfInterest.css";

const PointsOfInterest: FC<LayoutElementProperties<PointsOfInterestModel>> = (
    props
) => {
    const { model } = props;
    // Re-render whenever points of interest are added or removed from the
    // collection.
    useWatchCollectionAndRerender(model.pointsOfInterest);
    return (
        <LayoutElement {...props} stretch className="PointsOfInterest">
            <Typography variant="h2">Points of Interest 123</Typography>
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
        </LayoutElement>
    );
};

// This is an experiment, the react plugin in vite should be doing this.
function hotify<P>(Visual: FC<P>): FC<P> {
    const hot = import.meta.hot;
    if (!hot) {
        return Visual;
    }

    if (hot.data.Wrapper) {
        hot.data.Visual = Visual;
        return hot.data.Wrapper;
    }

    const Wrapper = (props: P) => {
        const [NextVisual, setNextVisual] = useState(() => hot.data.Visual);
        useEffect(() => {
            const cb = () => setNextVisual(() => hot.data.Visual);
            hot.accept(cb);
            cb();

            return () => hot.dispose(cb);
        }, []);

        return <NextVisual {...props} />;
    };

    hot.data.Visual = Visual;
    hot.data.Wrapper = Wrapper;
    
    return Wrapper;
}

export default hotify(PointsOfInterest);
