import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({
}) => {
  return (
    <TouchableOpacity
      className={`bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center `}
    >
      <Text className={`text-primary font-psemibold text-lg`}>CustomButton
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
