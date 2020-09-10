// Version 1
// fetch('/api')
//   .then((response) => response.json())
//   .then((data) => console.log(data.cleaned))
//   .catch((err) => console.log(err));

// More complete - Version 2
const getDataFromServer = async (url) => {
  const fetchedData = await fetch(url);
  const response = await fetchedData.json();
  const data = response.cleaned;
  console.log(data);
  const thead = document.querySelector('thead');
  const tbody = document.querySelector('tbody');
  thead.innerHTML = `
    <th scope='col'>ABBR</th>
    <th scope='col'>NAME</th>
    <th scope='col'>PRICE</th>
    <th scope='col'>CHANGE</th>
    `;
  data.map((d) => {
    tbody.innerHTML += `
        <tr>
        <td>${d.abbr}</td>
        <td>${d.name}</td>
        <td class=${d.change.charAt(0) === '+' ? 'up' : 'down'}>${d.price}</td>
        <td>${d.per_change}</td>
        </tr>`;
  });
};

getDataFromServer('/api');
