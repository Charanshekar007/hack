let chart;

async function fetchTransactions() {
    try {
        const res = await fetch('http://localhost:3000/transactions');
        const data = await res.json();

        const container = document.getElementById('transactions');
        container.innerHTML = '';

        const search = document.getElementById("search").value.toLowerCase();

        // 📊 Stats
        document.getElementById("totalTxns").innerText = data.length;
        const alertsCount = data.filter(txn => txn.alert !== "").length;
        document.getElementById("totalAlerts").innerText = alertsCount;

        // 📈 Chart FIXED
        const amounts = data.map(txn => txn.amount);
        const ctx = document.getElementById('txnChart').getContext('2d');

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map((_, i) => "Txn " + (i + 1)),
                datasets: [{
                    label: 'ALGO Amount',
                    data: amounts,
                    barThickness: 25,          // ✅ controls width
                    maxBarThickness: 30       // ✅ prevents huge bars
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,  // ✅ allows height control
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // 💳 Transactions
        data.forEach(txn => {

            if (
                txn.sender.toLowerCase().includes(search) ||
                txn.receiver.toLowerCase().includes(search)
            ) {

                let alertClass = "";
                if (txn.alert.includes("Large")) {
                    alertClass = "alert-large";
                } else if (txn.alert.includes("Suspicious")) {
                    alertClass = "alert-suspicious";
                }

                let risk = "Low";
                if (txn.alert.includes("Large")) risk = "High";
                else if (txn.alert.includes("Suspicious")) risk = "Medium";

                const div = document.createElement('div');
                div.className = 'card';

                div.innerHTML = `
                    <p><b>Sender:</b> ${txn.sender}</p>
                    <p><b>Receiver:</b> ${txn.receiver}</p>
                    <p><b>Amount:</b> ${txn.amount} ALGO</p>
                    <p><b>Type:</b> ${txn.type}</p>
                    <p><b>Risk:</b> ${risk}</p>
                    <p class="alert ${alertClass}">${txn.alert}</p>
                `;

                container.appendChild(div);
            }
        });

        if (container.innerHTML === '') {
            container.innerHTML = "<p>No matching transactions</p>";
        }

    } catch (err) {
        console.log("Error fetching data", err);
    }
}

// 🔄 Auto refresh
setInterval(fetchTransactions, 3000);

// Initial load
fetchTransactions();