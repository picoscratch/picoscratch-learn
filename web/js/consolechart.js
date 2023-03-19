const ctx = document.getElementById('chart');

export const chart = new Chart(ctx, {
	type: "line",
	data: {
		labels: [],
		datasets: [{
			label: "Data",
			data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		}]
	}
});

export let dataset = [];

export function addData(data) {
  dataset.push(data);
	chart.data.labels.push(new Date().getSeconds());
  chart.data.datasets[0].data = dataset;
  chart.update();
}

export function resetData() {
	dataset = [];
	chart.data.labels = [];
	chart.data.datasets[0].data = dataset;
	chart.update();
}