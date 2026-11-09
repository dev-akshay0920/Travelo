export { Watchlist } from "./watchlist.model";
export type { WatchlistDocument } from "./watchlist.model";
export { WatchlistRepository } from "./watchlist.repository";
export type {
  WatchlistCreateInput,
  WatchlistFilters,
  WatchlistListResponse,
} from "./watchlist.repository";
export { WatchlistService } from "./watchlist.service";
export type { ToggleWatchlistInput, WatchlistItem } from "./watchlist.service";
export { toggleWatchlistSchema } from "./watchlist.validation";
export type { ToggleWatchlistInput as ToggleWatchlistInputType } from "./watchlist.validation";
export { watchlistRouter } from "./watchlist.routes";
