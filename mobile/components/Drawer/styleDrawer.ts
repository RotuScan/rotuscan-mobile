
import { Dimensions, StatusBar, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },

  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingTop: (StatusBar.currentHeight ?? 0) + 20,
    paddingHorizontal: 15,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  profile: {
    alignItems: "flex-start",
    marginBottom: 25,
    paddingLeft: 4,
  },

  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  userName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },

  menuCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    zIndex: 2,
  },

  menuItem: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 8,
  },

  menuText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#006D37",
  },

  bottomArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 145,
    zIndex: 2,
  },

  logoutButton: {
    width: 70,
    height: 35,
    backgroundColor: "#006D37",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  chart: {
    position: "absolute",
    left: 4,
    bottom: 0,
    height: 125,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    opacity: 0.95,
  },

  bar: {
    width: 12,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
drawerImage:{
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 100,
    height: 150,
}
});
