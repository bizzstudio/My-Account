import "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChartSurvey = ({ data = { 1: 1, 2: 1, 3: 1 } }) => {
  const pieOptions = {
    data: {
      datasets: [
        {
          data: [data?.[1] || 0, data?.[2] || 0, data?.[3] || 0],
          backgroundColor: ["#10B981", "#3B82F6", "#F97316"],
          label: "כמות",
        },
      ],
      labels: [
        "מרוצה (1)",
        "לא מרוצה (2)",
        "מרוצה אך היו טעויות / חוסרים (3)"
      ],
    },
    options: {
      responsive: true,
      cutoutPercentage: 80,
    },
    legend: {
      display: false,
    },
  };

  return (
    <div>
      <Pie {...pieOptions} className="chart" />
    </div>
  );
};

export default PieChartSurvey;
