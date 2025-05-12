isc.setAutoDraw(false);

var grid = isc.ListGrid.create({
	dataSource: "Product",
	autoFetchData: true,
    groupByField: "productLine",
    sortByGroupFirst: true,
    initialSort: [
        {
            property: "buyPrice",
            direction: "ascending"
        }
    ],
    canEdit: true
});

isc.VLayout.create({
    width: "100%", height: "100%",
    autoDraw: true,
    members: [
        grid
    ]
});