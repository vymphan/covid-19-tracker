import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import './DataTable.css';

const columns = [
  {
    id: 'stateType',
    minWidth: 170,
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'asc',
  },
  {
    id: 'cases',
    label: 'Cases',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'desc',
  },
  {
    id: 'recovered',
    label: 'Recovered',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'desc',
  },
  {
    id: 'deaths',
    label: 'Deaths',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'desc',
  },
  {
    id: 'tests',
    label: 'Tests',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'desc',
  },
  {
    id: 'population',
    label: 'Population',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
    defaultSortOrder: 'desc'
  },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function DataTable({ stateType, data, casesType } ) {
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortProperty, setSortProperty] = React.useState(casesType);
  const [sortDirection, setSortDirection] = React.useState('desc');

  React.useEffect(() => {
    setSortProperty(casesType);
    setSortDirection('desc');
  }, [casesType, data]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const stateTypeColumnId = (stateType === "States and Territories" ? "state" : "country");

  const handleSortLabelClick = (newSortProperty) => {
    const column = columns.find((c) => c.id === newSortProperty);

    if (newSortProperty === 'stateType') newSortProperty = stateTypeColumnId;

    const isDefault = (newSortProperty === sortProperty && column && column.defaultSortOrder === sortDirection);
    setSortDirection(isDefault ? (sortDirection === 'asc' ? 'desc' : 'asc') : column.defaultSortOrder);
    setSortProperty(newSortProperty);
  }

  return (
    <Paper className={classes.root}>
    <TableContainer className={classes.container}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              const isActiveSort = sortProperty === column.id || (sortProperty === stateTypeColumnId && 'stateType' === column.id);
              return <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth, padding: 0 }}
                className={(casesType === column.id ? "sortkey " + casesType : "")}
                sortDirection={(sortProperty === column.id ? sortDirection : false)}
              >
                <TableSortLabel
                  active={isActiveSort}
                  direction={isActiveSort ? sortDirection : column.defaultSortOrder}
                  onClick={() => handleSortLabelClick(column.id)}
                  style={{"padding": "16px"}}
                >
                  {(column.id === "stateType" ? stateTypeColumnId.charAt(0).toUpperCase() + stateTypeColumnId.slice(1) : column.label)}
                </TableSortLabel>
              </TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(data, getComparator(sortDirection, sortProperty))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row[stateTypeColumnId]}>
                  {columns.map((column) => {
                    const value = row[(column.id === "stateType" ? stateTypeColumnId : column.id)];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        className={(casesType === column.id ? "sortkey " + casesType : "")}
                      >
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPageOptions={[10, 25, 100]}
      component="div"
      count={data.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  </Paper>
  );
}

export default DataTable;
