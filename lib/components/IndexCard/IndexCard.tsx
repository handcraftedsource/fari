import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RemoveIcon from "@material-ui/icons/Remove";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import { css } from "emotion";
import { default as React, useRef, useState } from "react";
import { IDataCyProps } from "../../domains/cypress/types/IDataCyProps";
import { AspectType } from "../../hooks/useScene/AspectType";
import { useScene } from "../../hooks/useScene/useScene";
import { useTextColors } from "../../hooks/useTextColors/useTextColors";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";
import { ContentEditable } from "../ContentEditable/ContentEditable";
import { DrawArea } from "../DrawArea/DrawArea";
import { FateLabel } from "../FateLabel/FateLabel";
import { IndexCardColor, IndexCardColorTypes } from "./IndexCardColor";

export const IndexCard: React.FC<
  {
    readonly: boolean;
    className?: string;
    id?: string;
    aspectId: string;
    sceneManager: ReturnType<typeof useScene>;
  } & IDataCyProps
> = (props) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const [menuOpen, setMenuOpen] = useState(false);
  const $menu = useRef(null);
  const colorPickerBackground = theme.palette.primary.dark;
  const aspect = props.sceneManager.state.scene.aspects[props.aspectId];
  const shouldRenderCheckboxesOrConsequences =
    aspect.tracks.length > 0 || aspect.consequences.length > 0;

  const shouldRenderAspectMenuItems = aspect.type !== AspectType.Boost;
  const shouldRenderContent = aspect.type !== AspectType.Boost;
  const shouldRenderPlayedDuringTurnIcon =
    aspect.type === AspectType.NPC || aspect.type === AspectType.BadGuy;

  const isDark = theme.palette.type === "dark";

  const paperBackground = isDark
    ? IndexCardColor[aspect.color].dark
    : IndexCardColor[aspect.color].light;
  const paperColor = useTextColors(paperBackground);
  const playedDuringTurnColor = aspect.playedDuringTurn
    ? theme.palette.primary.main
    : paperColor.disabled;

  return (
    <Paper elevation={undefined} className={props.className}>
      <Box bgcolor={paperBackground} color={paperColor.primary}>
        <Box
          className={css({
            fontSize: "1.5rem",
            width: "100%",
            padding: "0.5rem 0",
            borderBottom: "1px solid #f0a4a4",
          })}
        >
          <Box p={"0 1rem 1rem 1rem"}>
            {renderHeader()}
            {renderTitle()}
          </Box>
        </Box>
        {shouldRenderContent && renderContent()}
        {shouldRenderCheckboxesOrConsequences &&
          renderCheckboxesAndConsequences()}
        <Collapse in={aspect.drawAreaObjects !== undefined}>
          <Box>
            <DrawArea
              objects={aspect!.drawAreaObjects}
              onChange={(objects) => {
                props.sceneManager.actions.setAspectDrawAreaObjects(
                  props.aspectId,
                  objects
                );
              }}
              readonly={props.readonly}
            />
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );

  function renderHeader() {
    return (
      <Grid container justify="space-between" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="overline">
            {aspect.type === AspectType.Aspect && <>{t("index-card.aspect")}</>}
            {aspect.type === AspectType.Boost && <>{t("index-card.boost")}</>}
            {aspect.type === AspectType.NPC && <>{t("index-card.npc")}</>}
            {aspect.type === AspectType.BadGuy && (
              <>{t("index-card.bad-guy")}</>
            )}
          </Typography>
        </Grid>
        {!props.readonly && (
          <Grid item>
            <IconButton
              ref={$menu}
              size="small"
              data-cy={`${props["data-cy"]}.menu`}
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              classes={{
                list: css({
                  paddingBottom: 0,
                }),
              }}
              anchorEl={$menu.current}
              keepMounted
              open={menuOpen}
              onClose={() => {
                setMenuOpen(false);
              }}
            >
              {shouldRenderAspectMenuItems && renderAspectMenuItems()}
              {renderGlobalMenuItems()}
            </Menu>
          </Grid>
        )}
      </Grid>
    );
  }

  function renderTitle() {
    return (
      <Grid container justify="space-between" alignItems="center" spacing={2}>
        <Grid item xs>
          <ContentEditable
            id={props.id}
            data-cy={`${props["data-cy"]}.title`}
            value={aspect.title}
            readonly={props.readonly}
            onChange={(newTitle) => {
              props.sceneManager.actions.updateAspectTitle(
                props.aspectId,
                newTitle
              );
            }}
          />
        </Grid>
        <Grid item>
          {shouldRenderPlayedDuringTurnIcon && (
            <IconButton
              data-cy={`${props["data-cy"]}.initiative`}
              onClick={() => {
                props.sceneManager.actions.updateAspectPlayerDuringTurn(
                  props.aspectId,
                  !aspect.playedDuringTurn
                );
              }}
              disabled={props.readonly}
              size="small"
            >
              {aspect.playedDuringTurn ? (
                <DirectionsRunIcon htmlColor={playedDuringTurnColor} />
              ) : (
                <EmojiPeopleIcon htmlColor={playedDuringTurnColor} />
              )}
            </IconButton>
          )}
        </Grid>
      </Grid>
    );
  }

  function renderAspectMenuItems() {
    return [
      <MenuItem
        key="onAddAspectFreeInvoke"
        data-cy={`${props["data-cy"]}.menu.free-invokes`}
        onClick={() => {
          props.sceneManager.actions.addAspectTrack(
            props.aspectId,
            t("index-card.free-invokes")
          );
        }}
      >
        {t("index-card.add-free-invokes-track")}
      </MenuItem>,
      <MenuItem
        key="onAddAspectPhysicalStress"
        data-cy={`${props["data-cy"]}.menu.physical-stress`}
        onClick={() => {
          props.sceneManager.actions.addAspectTrack(
            props.aspectId,
            t("index-card.physical-stress")
          );
        }}
      >
        {t("index-card.add-physical-stress-track")}
      </MenuItem>,
      <MenuItem
        key="onAddAspectMentalStress"
        data-cy={`${props["data-cy"]}.menu.mental-stress`}
        onClick={() => {
          props.sceneManager.actions.addAspectTrack(
            props.aspectId,
            t("index-card.mental-stress")
          );
        }}
      >
        {t("index-card.add-mental-stress-track")}
      </MenuItem>,
      <MenuItem
        key="onAddConsequence"
        data-cy={`${props["data-cy"]}.menu.consequence`}
        onClick={() => {
          props.sceneManager.actions.addAspectConsequence(props.aspectId);
        }}
      >
        {t("index-card.add-1-consequence")}
      </MenuItem>,
      <MenuItem
        key="onAddCountdown"
        data-cy={`${props["data-cy"]}.menu.track`}
        onClick={() => {
          props.sceneManager.actions.addAspectTrack(props.aspectId, "...");
        }}
      >
        {t("index-card.add-track")}
      </MenuItem>,
      // <MenuItem
      //   key="addAspectDrawArea"
      //   onClick={() => {
      //     props.sceneManager.actions.addAspectDrawArea(props.aspectId);
      //   }}
      // >
      //   {t("index-card.add-draw-area")}
      // </MenuItem>,
      <Divider key="renderAspectMenuItemsDivider" />,
    ];
  }

  function renderGlobalMenuItems() {
    return [
      <MenuItem
        data-cy={`${props["data-cy"]}.menu.remove`}
        key="onRemove"
        onClick={() => {
          setMenuOpen(false);
          props.sceneManager.actions.removeAspect(props.aspectId);
        }}
      >
        {t("index-card.remove")}
      </MenuItem>,
      <MenuItem
        data-cy={`${props["data-cy"]}.menu.reset`}
        key="onReset"
        onClick={() => {
          setMenuOpen(false);
          props.sceneManager.actions.resetAspect(props.aspectId);
        }}
      >
        {t("index-card.reset")}
      </MenuItem>,
      <Divider key="renderGlobalMenuItemsDivider" light />,
      <MenuItem
        key="onUpdateAspectColor"
        className={css({
          "backgroundColor": colorPickerBackground,
          "cursor": "inherit",
          "&:hover": {
            backgroundColor: colorPickerBackground,
          },
        })}
        disableRipple
        disableTouchRipple
      >
        <Grid container justify="center">
          {Object.keys(IndexCardColor).map((c: string) => {
            const colorName = c as IndexCardColorTypes;
            return (
              <Grid item key={colorName}>
                <IconButton
                  data-cy={`${props["data-cy"]}.menu.color.${colorName}`}
                  onClick={(e) => {
                    props.sceneManager.actions.updateAspectColor(
                      props.aspectId,
                      colorName
                    );
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  size="small"
                >
                  {colorName === aspect.color ? (
                    <RadioButtonCheckedIcon
                      htmlColor={IndexCardColor[colorName].chip}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      htmlColor={IndexCardColor[colorName].chip}
                    />
                  )}
                </IconButton>
              </Grid>
            );
          })}
        </Grid>
      </MenuItem>,
    ];
  }

  function renderContent() {
    return (
      <Box
        className={css({
          fontSize: "1.1rem",
          lineHeight: "1.7rem",
          padding: "0.5rem 0",
          width: "100%",
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box p="0 1rem">
          <ContentEditable
            data-cy={`${props["data-cy"]}.content`}
            readonly={props.readonly}
            value={aspect.content}
            onChange={(newContent) => {
              props.sceneManager.actions.updateAspectContent(
                props.aspectId,
                newContent
              );
            }}
          />
        </Box>
      </Box>
    );
  }

  function renderCheckboxesAndConsequences() {
    return (
      <Box
        className={css({
          padding: "0.5rem 0",
          width: "100%",
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box p=".5rem 1rem">
          {renderTracks()}
          {renderConsequences()}
        </Box>
      </Box>
    );
  }

  function renderTracks() {
    return (
      <Box>
        {aspect.tracks.map((stressTrack, trackIndex) => {
          return (
            <Box pb=".5rem" key={trackIndex}>
              <Grid container justify="space-between" wrap="nowrap" spacing={1}>
                <Grid item className={css({ flex: "1 1 auto" })}>
                  <FateLabel display="inline" size="small">
                    <ContentEditable
                      data-cy={`${props["data-cy"]}.stressTrack.${stressTrack.name}.name`}
                      value={stressTrack.name}
                      readonly={props.readonly}
                      onChange={(newTrackName) => {
                        props.sceneManager.actions.updateAspectTrackName(
                          props.aspectId,
                          trackIndex,
                          newTrackName
                        );
                      }}
                    />
                  </FateLabel>
                </Grid>
                {!props.readonly && (
                  <Grid item>
                    <IconButton
                      size="small"
                      data-cy={`${props["data-cy"]}.stressTrack.${stressTrack.name}.remove-box`}
                      onClick={() => {
                        props.sceneManager.actions.removeAspectTrackBox(
                          props.aspectId,
                          trackIndex
                        );
                      }}
                    >
                      <RemoveCircleOutlineIcon
                        className={css({
                          width: "1rem",
                          height: "1rem",
                        })}
                      />
                    </IconButton>
                  </Grid>
                )}
                {!props.readonly && (
                  <Grid item>
                    <IconButton
                      size="small"
                      data-cy={`${props["data-cy"]}.stressTrack.${stressTrack.name}.add-box`}
                      onClick={() => {
                        props.sceneManager.actions.addAspectTrackBox(
                          props.aspectId,
                          trackIndex
                        );
                      }}
                    >
                      <AddCircleOutlineIcon
                        className={css({
                          width: "1rem",
                          height: "1rem",
                        })}
                      />
                    </IconButton>
                  </Grid>
                )}
                {!props.readonly && (
                  <Grid item>
                    <IconButton
                      size="small"
                      data-cy={`${props["data-cy"]}.stressTrack.${stressTrack.name}.remove`}
                      onClick={() => {
                        props.sceneManager.actions.removeAspectTrack(
                          props.aspectId,
                          trackIndex
                        );
                      }}
                    >
                      <RemoveIcon
                        className={css({
                          width: "1rem",
                          height: "1rem",
                        })}
                      />
                    </IconButton>
                  </Grid>
                )}
              </Grid>

              <Grid container justify="flex-start" spacing={2}>
                {stressTrack.value.map((stressBox, boxIndex) => {
                  return (
                    <Grid item key={boxIndex}>
                      <Box
                        className={css({
                          display: "flex",
                          justifyContent: "center",
                        })}
                      >
                        <Checkbox
                          data-cy={`${props["data-cy"]}.stressTrack.${stressTrack.name}.box.${boxIndex}`}
                          color="default"
                          size="small"
                          checked={stressBox.checked}
                          onChange={(event) => {
                            if (props.readonly) {
                              return;
                            }
                            props.sceneManager.actions.toggleAspectTrackBox(
                              props.aspectId,
                              trackIndex,
                              boxIndex
                            );
                          }}
                        />
                      </Box>
                      <Box>
                        <FateLabel
                          className={css({ textAlign: "center" })}
                          size="small"
                        >
                          <ContentEditable
                            readonly={props.readonly}
                            value={stressBox.label}
                            onChange={(newBoxLabel) => {
                              props.sceneManager.actions.updateStressBoxLabel(
                                props.aspectId,
                                trackIndex,
                                boxIndex,
                                newBoxLabel
                              );
                            }}
                          />
                        </FateLabel>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  }

  function renderConsequences() {
    return (
      <Box>
        <Grid container justify="center">
          {aspect.consequences.map((consequence, consequenceIndex) => {
            const name =
              consequence.name ||
              `${t("index-card.consequence")}  (${(consequenceIndex + 1) * 2})`;
            const value = consequence.value;

            return (
              <Grid key={consequenceIndex} item xs={12}>
                <Box py=".5rem">
                  <Grid container>
                    <Grid item className={css({ flex: "1 1 auto" })}>
                      <FateLabel size="small">
                        <ContentEditable
                          data-cy={`${props["data-cy"]}.consequence.${name}.name`}
                          value={name}
                          readonly={props.readonly}
                          onChange={(newName) => {
                            props.sceneManager.actions.updateAspectConsequenceName(
                              props.aspectId,
                              consequenceIndex,
                              newName
                            );
                          }}
                        />
                      </FateLabel>
                    </Grid>
                    <Grid item>
                      <IconButton
                        size="small"
                        data-cy={`${props["data-cy"]}.consequence.${name}.remove`}
                        onClick={() => {
                          props.sceneManager.actions.removeAspectConsequence(
                            props.aspectId,
                            consequenceIndex
                          );
                        }}
                      >
                        <RemoveIcon
                          className={css({
                            width: "1rem",
                            height: "1rem",
                          })}
                        />
                      </IconButton>
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    value={value}
                    onChange={(event) => {
                      if (props.readonly) {
                        return;
                      }
                      props.sceneManager.actions.updateAspectConsequenceValue(
                        props.aspectId,
                        consequenceIndex,
                        event.target.value
                      );
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }
};
