import { connect } from "react-redux";
import { Component } from "react";
import { debounce } from "lodash";

import { getPokemons } from "../redux/actions/pokemonActions";
import Layout from "../components/layout";
import { PokemonRow } from "../components/pokemonRow";
import { Typography, createStyles } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { withTranslation } from "react-i18next";
import "../utils/i18n";

const styles = theme =>
  createStyles({
    layoutContainer: {
      justifyContent: "space-around"
    },
    pokemonsBox: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around"
    },
    pokemonRowBox: {
      width: "45%",
      [theme.breakpoints.up("sm")]: {
        width: "33%"
      }
    },
    selected: {
      borderRadius: 10,
      backgroundColor: "blue"
    }
  });

class Index extends Component {
  constructor(props) {
    super(props);
    this.onScroll = this.handleScroll.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.state = {
      selectedPokemon: []
    };
  }
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("mousewheel", this.handleMouseWheel);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll, false);
    window.removeEventListener("mousewheel", this.handleMouseWheel, false);
  }

  handleMouseWheel = debounce(event => {
    if (event.wheelDelta < 0) {
      var list = document.getElementById("list");
      if (list.clientHeight <= window.innerHeight) {
        this.props.getPokemonsData({ page: this.props.page });
      }
    }
  }, 500);

  handleScroll = debounce(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      this.props.getPokemonsData({ page: this.props.page });
    }
  }, 2000);

  handleClick = pokemonIndex => {
    const currentSelected = this.state.selectedPokemon;
    if (currentSelected.length === 2) {
      currentSelected.shift();
    }
    currentSelected.push(pokemonIndex);
    this.setState({ selectedPokemon: currentSelected });
  };

  render() {
    const { classes, pokemons, error, t } = this.props;
    return (
      <Layout
        containerSize={"sm"}
        home
        selectedPokemon={this.state.selectedPokemon}
      >
        <div id={"list"} className={classes.layoutContainer}>
          {error && error.code === "ECONNREFUSED" && (
            <Typography color="primary">
              {/* {t("errorOnApi")} {error.message} */}
            </Typography>
          )}
          <div className={classes.pokemonsBox}>
            {pokemons &&
              pokemons.map((pokemon, index) => {
                // pokemons are 1-150..., so we do offset +1
                const pokemonIndex = (index += 1);
                return (
                  <div
                    key={index + 1}
                    className={`${classes.pokemonRowBox} ${
                      this.state.selectedPokemon.indexOf(pokemonIndex) >= 0
                        ? classes.selected
                        : ""
                    }`}
                    onClick={() => {
                      this.handleClick(pokemonIndex);
                    }}
                  >
                    <PokemonRow name={pokemon.name} index={pokemonIndex} />
                  </div>
                );
              })}
          </div>
        </div>
      </Layout>
    );
  }
}

Index.getInitialProps = async ctx => {
  const { pokemons } = await ctx.store.dispatch(
    getPokemons({ isServer: true })
  );
  return { pokemons };
};

const mapDistpatchToProps = dispatch => ({
  getPokemonsData: ({ page }) => dispatch(getPokemons({ page }))
});

const mapStateToProps = state => ({
  pokemons: state.pokemonsReducer.data.pokemons,
  page: state.pokemonsReducer.data.page,
  error: state.pokemonsReducer.data.error
});

export default connect(
  mapStateToProps,
  mapDistpatchToProps
)(withStyles(styles)(Index));
