import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import Board from "../pages/Boards/_id.jsx";
import BoardContent from "~/pages/Boards/BoardContent/BoardContent.jsx";

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree/>}>
      <ComponentPreview path="/Board">
        <Board/>
      </ComponentPreview>
      <ComponentPreview path="/BoardContent">
        <BoardContent/>
      </ComponentPreview>
    </Previews>
  )
}

export default ComponentPreviews