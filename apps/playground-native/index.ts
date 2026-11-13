import { registerRootComponent } from 'expo';

import App from './App';
import { docsPreviewRoot } from './docs-preview';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// On web, `?demo=<name>` renders a single demo for the docs' preview instead.
registerRootComponent(docsPreviewRoot() ?? App);
