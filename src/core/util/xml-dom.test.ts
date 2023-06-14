import { compact } from './collection.js'
import { parseXML } from './xml-dom.js'

const xmlFixture = `
<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
 "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta content="urn:uuid:2c66073cfc024b8e904a53f8aecadce8" name="dtb:uid"/>
    <meta content="1" name="dtb:depth"/>
    <meta content="0" name="dtb:totalPageCount"/>
    <meta content="0" name="dtb:maxPageNumber"/>
  </head>
  <docTitle>
    <text>Unknown</text>
  </docTitle>
  <navMap>

    <navPoint id="navPoint-1" playOrder="1">
      <navLabel>
        <text>html entities & text</text>
      </navLabel>
      <content src="Text/000.html"/>
    </navPoint>
    </navMap>
</ncx>
`

it('parseXML', async () => {
  const doc = await parseXML(xmlFixture)
  expect(doc.name).toBe('ncx')
  expect(
    compact(
      doc.children?.map((c) => (typeof c === 'object' ? c.name : undefined)) ??
        []
    )
  ).toEqual(['head', 'docTitle', 'navMap'])
})
