import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Container,
  Grid,
  InputLabel,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import appIcon from "../../../images/app-icon.png";
import { ManagerMode } from "../../components/Manager/Manager";
import { Page } from "../../components/Page/Page";
import {
  CharactersContext,
  ICharacter,
} from "../../contexts/CharactersContext/CharactersContext";
import { isWebRTCSupported } from "../../hooks/usePeerJS/usePeerJS";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";

let playerNameSingleton = "";

export const JoinAGame: React.FC<{
  idFromParams: string;
  onSubmitPlayerName(playerName: string): void;
  onSubmitCharacter(character: ICharacter): void;
  connecting: boolean;
  error: any;
}> = (props) => {
  const { t } = useTranslate();
  const [playerName, setPlayerName] = useState(playerNameSingleton);
  const charactersManager = useContext(CharactersContext);

  function onSubmitPlayerName(playerName: string) {
    props.onSubmitPlayerName(playerName);
  }

  function onSubmitCharacter(character: ICharacter) {
    props.onSubmitCharacter(character);
  }

  useEffect(() => {
    playerNameSingleton = playerName;
  }, [playerName]);

  return (
    <Page gameId={props.idFromParams}>
      <Box>
        <Box pb="1rem">
          <Container maxWidth="xs">
            {isWebRTCSupported() ? renderConnectionForm() : renderWebRTCError()}
          </Container>
        </Box>
      </Box>
    </Page>
  );

  function renderWebRTCError() {
    return (
      <Box>
        <Box pb="2rem" textAlign="center">
          <Typography variant="h4">{t("play-route.error.title")}</Typography>
        </Box>
        <Box pb="1rem" textAlign="center">
          <Typography variant="body1">
            {t("play-route.error.webRTC")}
          </Typography>
        </Box>
      </Box>
    );
  }

  function renderConnectionForm() {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSubmitPlayerName(playerName);
        }}
      >
        <Box pb="2rem" textAlign="center">
          <img width="150px" src={appIcon} />
        </Box>
        <Box pb="2rem" textAlign="center">
          <Typography variant="h4">
            {t("play-route.connect-to-game")}
          </Typography>
        </Box>
        <Collapse in={props.connecting}>
          <Box pb="2rem">
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          </Box>
        </Collapse>
        <Collapse in={props.error}>
          <Box pb="2rem" textAlign="center">
            <Typography color="error">{t("play-route.join-error")}</Typography>
          </Box>
        </Collapse>
        <Box pb="1rem">
          <Grid container justify="center">
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  charactersManager.actions.openManager(
                    ManagerMode.Use,
                    onSubmitCharacter
                  );
                }}
              >
                {t("play-route.or-pick-existing")}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box py="3rem">
          <Typography variant="h6" align="center">
            {t("play-route.or")}
          </Typography>
        </Box>
        <Box pb="1rem">
          <Paper>
            <Box p="1rem">
              <Box pb="1rem">
                <InputLabel shrink>{t("play-route.character-name")}</InputLabel>
                <TextField
                  placeholder="Magnus Burnsides"
                  value={playerName}
                  onChange={(event) => {
                    setPlayerName(event.target.value);
                  }}
                  inputProps={{
                    maxLength: "50",
                  }}
                  fullWidth
                  required
                />
              </Box>
              <Box>
                <Grid container justify="flex-end">
                  <Grid item>
                    <Button
                      type="submit"
                      variant={playerName ? "contained" : "outlined"}
                      color="secondary"
                    >
                      {playerName
                        ? t("play-route.join-as", { playerName: playerName })
                        : t("play-route.join")}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Box>
      </form>
    );
  }
};

JoinAGame.displayName = "JoinAGame";
