import { Composition } from "remotion";
import { FlattenTree } from "./FlattenTree/FlattenTree";

export const Root: React.FC = () => {
  return (
    <Composition
      id="FlattenTree"
      component={FlattenTree}
      durationInFrames={540}
      fps={30}
      width={1280}
      height={1000}
    />
  );
};
