import {Container} from "@mui/material";
import AppBar from "../../components/AppBar/index.jsx";
import BoardBar from "./BoardBar/index.jsx";
import BoardContent from "./BoardContent/index.jsx";

function Board() {
  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{height: '100vh', backgroundColor: 'primary.main'}}
    >
      <AppBar/>
      <BoardBar/>
      <BoardContent/>
    </Container>
  );
}

export default Board;