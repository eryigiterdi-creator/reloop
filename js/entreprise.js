

window.addEventListener('DOMContentLoaded', async ()=>{
  const data = await ReLoopSite.loadSiteData();
  ReLoopSite.renderEnterpriseTypes(document.getElementById('types'), data.enterprise_types);
});
