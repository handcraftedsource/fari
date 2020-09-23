import { SvgIconProps } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { DrawObjectFactory } from "../domains/DrawObjectFactory";
import { pickerColors } from "../domains/pickerColors";
import { rough } from "../domains/rough";
import { AllTokens } from "../tokens/tokens";

if (pickerColors.length !== AllTokens.length) {
  throw "useDrawing: pickerColors.length and AllTokens.length don't match";
}

export enum DrawingTool {
  ColorPicker,
  Line,
  Move,
  Remove,
  Rectangle,
  Ellipse,
  Token,
}

export enum ObjectType {
  Line,
  Rectangle,
  Ellipse,
  Token,
}

export type IDrawAreaObjects = Array<IObject>;

export type IObject =
  | ILineObject
  | ITokenObject
  | IRectangleObject
  | IEllipseObject;

export type ITokenObject = {
  type: ObjectType.Token;
  Token: React.FC<SvgIconProps>;
  color: string;
  point: IPoint;
};

export type ILineObject = {
  type: ObjectType.Line;
  color: string;
  points: Array<IPoint>;
};

export type IRectangleObject = {
  type: ObjectType.Rectangle;
  color: string;
  form: IForm;
};

export type IEllipseObject = {
  type: ObjectType.Ellipse;
  color: string;
  form: IForm;
};

export type IPoint = {
  x: number;
  y: number;
};

export type IForm = {
  start: IPoint;
  end: IPoint;
};

const ON_CHANGE_DELAY = 500;

export function useDrawing(props: {
  objects?: IDrawAreaObjects;
  readonly?: boolean;
  onChange?(objects: IDrawAreaObjects): void;
}) {
  const [objects, setObjects] = useState<IDrawAreaObjects>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState(DrawingTool.Line);

  const [color, setColor] = useState("#000000");
  const [tokenIndex, setTokenIndex] = useState(0);
  const $container = useRef<HTMLDivElement | null>(null);
  const $svgElement = useRef<SVGSVGElement | null>(null);
  const onChangeTimeout = useRef<any | undefined>(undefined);

  const roughSVG = $svgElement.current && rough.svg($svgElement.current);

  useEffect(() => {
    const shouldUpdateLocalState =
      props.objects && props.objects.length !== objects.length;
    if (shouldUpdateLocalState) {
      setObjects(props.objects as IDrawAreaObjects);
    }
  }, [props.objects]);

  useEffect(() => {
    changeWithDelay(objects);
  }, [objects]);

  function changeWithDelay(objects: IDrawAreaObjects) {
    clearTimeout(onChangeTimeout.current);
    onChangeTimeout.current = setTimeout(() => {
      props.onChange?.(objects);
    }, ON_CHANGE_DELAY);
  }

  function onStartDrawing(pointerEvent: React.PointerEvent<HTMLDivElement>) {
    if (pointerEvent.button !== 0 || props.readonly) {
      return;
    }

    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    const newPoint = relativeCoordinatesForEvent(pointerEvent);
    if (!newPoint) {
      return;
    }

    setDrawing(true);

    switch (drawingTool) {
      case DrawingTool.Rectangle: {
        setObjects((objects) => {
          return [
            ...objects,
            DrawObjectFactory.startRectangle({ color: color, point: newPoint }),
          ];
        });
        break;
      }
      case DrawingTool.Ellipse: {
        setObjects((objects) => {
          return [
            ...objects,
            DrawObjectFactory.startEllipse({ color: color, point: newPoint }),
          ];
        });
        break;
      }
      case DrawingTool.Token: {
        const tokenColor = pickerColors[tokenIndex];
        const Token = AllTokens[tokenIndex];

        setTokenIndex((prevIndex) => {
          const shouldResetIndex = prevIndex === pickerColors.length - 1;
          if (shouldResetIndex) {
            return 0;
          }
          return prevIndex + 1;
        });
        setObjects((objects) => {
          return [
            ...objects,
            DrawObjectFactory.startToken({
              color: tokenColor,
              Token: Token,
              point: newPoint,
            }),
          ];
        });
        break;
      }
      case DrawingTool.Line: {
        setObjects((objects) => {
          return [
            ...objects,
            DrawObjectFactory.startLine({ color: color, point: newPoint }),
          ];
        });
        break;
      }
    }
  }

  function onDrawing(pointerEvent: React.PointerEvent<HTMLDivElement>) {
    if (!drawing) {
      return;
    }

    const newPoint = relativeCoordinatesForEvent(pointerEvent);
    if (newPoint) {
      setObjects((objects) => {
        const lastLineIndex = objects.length - 1;
        return objects.map((object, index) => {
          const shouldUpdate = index === lastLineIndex;
          if (!shouldUpdate) {
            return object;
          }

          switch (object.type) {
            case ObjectType.Rectangle: {
              return {
                ...object,
                form: {
                  start: object.form.start,
                  end: newPoint,
                },
              };
            }
            case ObjectType.Ellipse: {
              return {
                ...object,
                form: {
                  start: object.form.start,
                  end: newPoint,
                },
              };
            }
            case ObjectType.Line: {
              return {
                ...object,
                points: [...object.points, newPoint],
              };
            }
            default: {
              return object;
            }
          }
        });
      });
    }
  }

  function onStopDrawing(pointerEvent: React.PointerEvent<HTMLDivElement>) {
    if (pointerEvent.pointerType == "mouse") {
      setDrawing(false);
    }
  }

  function onObjectMove(
    objectIndex: number,
    startEvent: PointerEvent,
    moveEvent: PointerEvent
  ) {
    const startPoint = relativeCoordinatesForEvent(startEvent);
    const movePoint = relativeCoordinatesForEvent(moveEvent);
    const diffX = movePoint.x - startPoint.x;
    const diffY = movePoint.y - startPoint.y;

    setObjects((objects) => {
      return objects.map((object, index) => {
        const shouldUpdate = index === objectIndex;
        if (!shouldUpdate) {
          return object;
        }

        switch (object.type) {
          case ObjectType.Rectangle: {
            return DrawObjectFactory.moveRectangle({
              object: object,
              x: diffX,
              y: diffY,
            });
          }
          case ObjectType.Ellipse: {
            return DrawObjectFactory.moveEllipse({
              object: object,
              x: diffX,
              y: diffY,
            });
          }
          case ObjectType.Token: {
            return DrawObjectFactory.moveToken({
              object: object,
              x: diffX,
              y: diffY,
            });
          }
          default: {
            return DrawObjectFactory.moveLine({
              object: object,
              x: diffX,
              y: diffY,
            });
          }
        }
      });
    });
  }

  function onObjectRemove(objectIndex: number) {
    setObjects((lines) => {
      return lines.filter((object, index) => {
        return index !== objectIndex;
      });
    });
  }

  function onBlur(blurEvent: React.FocusEvent<HTMLDivElement>) {
    if (drawing) {
      setDrawing(false);
    }
  }

  function relativeCoordinatesForEvent(
    pointerEvent: React.PointerEvent<unknown> | PointerEvent
  ): IPoint {
    if ($container.current) {
      const boundingRect = $container.current.getBoundingClientRect();
      const x = pointerEvent.clientX - boundingRect.left;
      const y = pointerEvent.clientY - boundingRect.top;
      const point = {
        x: (x / boundingRect.width) * 100,
        y: (y / boundingRect.height) * 100,
      } as IPoint;
      return point;
    }
    return {
      x: 0,
      y: 0,
    };
  }

  function clear() {
    setObjects([]);
    setTokenIndex(0);
  }

  function undo() {
    setObjects((objects) => {
      const lastElementIndex = objects.length - 1;
      const newObjects = objects.filter((object, index) => {
        return index !== lastElementIndex;
      });
      return newObjects;
    });
  }

  return {
    state: {
      objects: objects,
      isDrawing: drawing,
      $container,
      $svgElement,
      roughSVG,
      drawingTool,
      color,
    },
    actions: {
      clear,
      undo,
      setColor,
      setDrawingTool,
    },
    handlers: {
      onStartDrawing: onStartDrawing,
      onDrawing: onDrawing,
      onStopDrawing: onStopDrawing,
      onBlur,
      onObjectMove,
      onObjectRemove,
    },
  };
}
