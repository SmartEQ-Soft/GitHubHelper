export const COMMANDS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  SETPASS: "SETPASS",
  DO_REBOOT: "DO REBOOT",
  DO_SHUTDOWN: "DO SHUTDOWN",
  DO_TAKESNAPSHOT: "DO TAKESNAPSHOT",
  FILES: "FILES",
  DO_SCRIPT: "DO SCRIPT",
  DO_SETINT: "DO SETINT",
  DO_SETBOOL: "DO SETBOOL",
  DO_SETSTR: "DO SETSTR",
  DO_MONITOR: "DO MONITOR",
  DO_LOADJSON: "DO LOADJSON",
  DO_MONITORECS: "DO MONITORECS",
} as const;

export interface LoginResponse {
  c: "login" | "loginok";
  salt?: string;
  msg?: string;
  username?: string;
  cookie?: string;
  version?: string;
  user?: {
    ad?: string;
    soyad?: string;
    utype?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CameraResponse {
  c: "cameras";
  cameras: {
    name: string;
    url: string;
    status: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}

export interface SystemResponse {
  c: "system";
  system: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ErrorResponse {
  c: "error";
  msg: string;
  [key: string]: any;
}

export type SmartWebResponse =
  | LoginResponse
  | CameraResponse
  | SystemResponse
  | ErrorResponse
  | { c: string; [key: string]: any };

export function parseJsonMessage(message: string): SmartWebResponse | null {
  try {
    return JSON.parse(message) as SmartWebResponse;
  } catch (error) {
    console.error("JSON parse hatası:", error);
    return null;
  }
}

export function isResponseType<T extends SmartWebResponse>(
  response: SmartWebResponse | null,
  commandType: string
): response is T {
  return response !== null && response.c === commandType;
}

export function isLoginResponse(
  response: SmartWebResponse | null
): response is LoginResponse {
  return (
    response !== null && (response.c === "login" || response.c === "loginok")
  );
}

export function isCameraResponse(
  response: SmartWebResponse | null
): response is CameraResponse {
  return isResponseType<CameraResponse>(response, "cameras");
}

export function isSystemResponse(
  response: SmartWebResponse | null
): response is SystemResponse {
  return isResponseType<SystemResponse>(response, "system");
}

export function isErrorResponse(
  response: SmartWebResponse | null
): response is ErrorResponse {
  return isResponseType<ErrorResponse>(response, "error");
}

export function hasErrorMessage(response: SmartWebResponse | null): boolean {
  if (!response || !response.msg) return false;

  const errorKeywords = ["hata", "yanlış", "error", "failed", "başarısız"];
  const msg = response.msg.toLowerCase();

  return errorKeywords.some((keyword) => msg.includes(keyword));
}

export function addCameraGroupCommand(groupName: string): string {
  return `${COMMANDS.DO_SCRIPT} "add_camera_group.sh" "${groupName}"`;
}

export function removeCameraGroupCommand(groupName: string): string {
  return `${COMMANDS.DO_SCRIPT} "remove_camera_group.sh" "${groupName}"`;
}

export function addGroupToCameraCommand(
  cameraName: string,
  groupName: string
): string {
  return `${COMMANDS.DO_SCRIPT} "add_group_to_cam.sh" "${cameraName}" "${groupName}"`;
}

export function setIntValueCommand(
  variableName: string,
  value: number
): string {
  return `${COMMANDS.DO_SETINT} ${variableName} ${value}`;
}

export function setBoolValueCommand(
  variableName: string,
  value: boolean
): string {
  return `${COMMANDS.DO_SETBOOL} ${variableName} ${value}`;
}

export function setStringValueCommand(
  variableName: string,
  value: string
): string {
  return `${COMMANDS.DO_SETSTR} ${variableName} "${value}"`;
}
