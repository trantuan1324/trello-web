import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import Board from "../pages/Boards/_id.jsx";

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree/>}>
      <ComponentPreview path="/Board">
        <Board/>
      </ComponentPreview>
    </Previews>
  )
}

export default ComponentPreviews