import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

// import DatePicker from "@dietime/react-native-date-picker";
import moment from "moment";

export default function LogCalendar() {
  // Get the current date
  const currentDate = new Date();

  // Extract year and month
  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth() + 1; // Months are zero-based, so add 1

  // Construct the default date in the required format
  const defaultDate = `${currentYear}-${currentMonth
    .toString()
    .padStart(2, "0")}-01T00:00:00.000Z`;

  console.log(
    "🚀 ~ file: LogCalendar.js:19 ~ LogCalendar ~ defaultDate:",
    defaultDate
  );

  const [date, setDate] = useState(null);

  return (
    <View>
      {/* <DatePicker
        value={date}
        onChange={(value) => setDate(value)}
        format="mm-yyyy"
        height={80}
        width={240}
        markWidth={90}
        textColor="white"
        markColor="#2D7482"
        fadeColor="#611595"
        fontSize={16}
        endYear={parseInt(moment().format("YYYY"))}
        startYear={parseInt(moment().subtract(10, "years").format("YYYY"))}
      /> */}
    </View>
  );
}
