import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        display: flex,
        justifyContent: center,
        alignItems: center,
        margin: 0,                // Remove default margin
    },
}));

export default useStyles;