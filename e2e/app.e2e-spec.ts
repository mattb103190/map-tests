import { MapTestsPage } from './app.po';

describe('map-tests App', () => {
  let page: MapTestsPage;

  beforeEach(() => {
    page = new MapTestsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
